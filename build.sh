#!/bin/bash

print_manual()
{
	EscChar="\033"
	ColorReset="${EscChar}[m"
	RedColor="${EscChar}[31;1m"
	GreenColor="${EscChar}[32;1m"
	YellowColor="${EscChar}[33;1m"
	YellowColor2="${EscChar}[33m"
	BlueColor="${EscChar}[34;1m"
	CyanColor="${EscChar}[36;1m"

	printf "\n${GreenColor}Required environmental options:${ColorReset}"
	printf "\n${YellowColor}PLATFORM${ColorReset} - one of the supported targets: osx|windows|linux|rpi"
	printf "\n${YellowColor}DOCKER_TAG${ColorReset} | ${YellowColor}DOCKER_IMAGE${ColorReset} - both are required only for linux|rpi platforms:"

	printf "\n   Debian => ${YellowColor2}bullseye${ColorReset} | ${YellowColor2}x86_64${ColorReset}"
	printf "\n   Debian => ${YellowColor2}bullseye${ColorReset} | ${YellowColor2}arm-32bit-armv6l${ColorReset}"
	printf "\n   Debian => ${YellowColor2}bullseye${ColorReset} | ${YellowColor2}arm-64bit-aarch64${ColorReset}"
	printf "\n   Debian => ${YellowColor2}bookworm${ColorReset} | ${YellowColor2}x86_64${ColorReset}"
	printf "\n   Debian => ${YellowColor2}bookworm${ColorReset} | ${YellowColor2}arm-32bit-armv6l${ColorReset}"
	printf "\n   Debian => ${YellowColor2}bookworm${ColorReset} | ${YellowColor2}arm-64bit-aarch64${ColorReset}"
	printf "\n   Ubuntu => ${YellowColor2}jammy${ColorReset} | ${YellowColor2}x86_64${ColorReset}"
	printf "\n   Ubuntu => ${YellowColor2}noble${ColorReset} | ${YellowColor2}x86_64${ColorReset}"
	printf "\n   Fedora => ${YellowColor2}Fedora_40${ColorReset} | ${YellowColor2}x86_64${ColorReset}"
	printf "\n   ArchLinux => ${YellowColor2}ArchLinux${ColorReset} | ${YellowColor2}x86_64${ColorReset}"

	printf "\n\n${GreenColor}Optional environmental options:${ColorReset}"
	printf "\n${CyanColor}BUILD_TYPE${ColorReset} - Release|Debug, default is Release version"
	printf "\n${CyanColor}BUILD_ARCHIVES${ColorReset} - false|true, cpack will build ZIP package"
	printf "\n${CyanColor}USE_STANDARD_INSTALLER_NAME${ColorReset} - false|true, use standard Linux package naming"
	printf "\n${CyanColor}USE_CCACHE${ColorReset} - false|true, use ccache if available"
	printf "\n${CyanColor}RESET_CACHE${ColorReset} - false|true, reset ccache storage"
	printf "\n\n${GreenColor}Example of usage:${ColorReset}\n${YellowColor}PLATFORM=rpi DOCKER_TAG=bullseye DOCKER_IMAGE=arm-64bit-aarch64 ./build.sh${ColorReset}"
	printf "\nInstallers from Docker builds will be ready in the ${RedColor}deploy${ColorReset} folder"
	printf "\n\n"
	exit 0
}

if [[ "$PLATFORM" == "" || ( ("$PLATFORM" == "linux" || "$PLATFORM" == "rpi") && ( "$DOCKER_IMAGE" = "" || "$DOCKER_TAG" = "" ) ) ]]; then
	print_manual
fi

# detect CI
if [ "$SYSTEM_COLLECTIONID" != "" ]; then
	# Azure Pipelines
	echo "Azure detected"
	CI_NAME="$(echo "$AGENT_OS" | tr '[:upper:]' '[:lower:]')"
	CI_BUILD_DIR="$BUILD_SOURCESDIRECTORY"
	CI_TYPE="azure"
elif [ "$GITHUB_ACTIONS" != "" ]; then
	# GitHub Actions
	echo "Github Actions detected"
	CI_NAME="$(uname -s | tr '[:upper:]' '[:lower:]')"
	CI_BUILD_DIR="$GITHUB_WORKSPACE"
	CI_TYPE="github_action"
else
	# for executing in non ci environment
	echo "Local system build detected"
	CI_NAME="$(uname -s | tr '[:upper:]' '[:lower:]')"
	CI_TYPE="other"
	CI_BUILD_DIR="$PWD"
fi

# set environment variables if not exists
[ -z "${BUILD_TYPE}" ] && BUILD_TYPE="Release"
[ -z "${USE_STANDARD_INSTALLER_NAME}" ] && USE_STANDARD_INSTALLER_NAME=false
[ -z "${USE_CCACHE}" ] && USE_CCACHE=true
[ -z "${RESET_CACHE}" ] && RESET_CACHE=false
[ -z "${BUILD_ARCHIVES}" ] && BUILD_ARCHIVES=true


printf "\nPLATFORM = %s" ${PLATFORM}
printf "\nDOCKER_TAG = %s" ${DOCKER_TAG}
printf "\nDOCKER_IMAGE = %s" ${DOCKER_IMAGE}
printf "\nBUILD_TYPE = %s" ${BUILD_TYPE}
printf "\nBUILD_ARCHIVES = %s" ${BUILD_ARCHIVES}
printf "\nUSE_STANDARD_INSTALLER_NAME = %s" ${USE_STANDARD_INSTALLER_NAME}
printf "\nUSE_CCACHE = %s" ${USE_CCACHE}
printf "\nRESET_CACHE = %s" ${RESET_CACHE}
printf "\n"

if [ ${BUILD_ARCHIVES} = true ]; then
	echo "Build the package archive"
	ARCHIVE_OPTION=" -DBUILD_ARCHIVES=ON"	
else
	echo "Do not build the package archive"
	ARCHIVE_OPTION=" -DBUILD_ARCHIVES=OFF"
fi

if [ ${USE_STANDARD_INSTALLER_NAME} = true ]; then
	echo "Use standard naming"
	ARCHIVE_OPTION=" ${ARCHIVE_OPTION} -DUSE_STANDARD_INSTALLER_NAME=ON"	
else
	echo "Do not use standard naming"
	ARCHIVE_OPTION=" ${ARCHIVE_OPTION} -DUSE_STANDARD_INSTALLER_NAME=OFF"
fi

echo "Platform: ${PLATFORM}, build type: ${BUILD_TYPE}, CI_NAME: $CI_NAME, docker image: ${DOCKER_IMAGE}, docker type: ${DOCKER_TAG}, archive options: ${ARCHIVE_OPTION}, use ccache: ${USE_CCACHE}, reset ccache: ${RESET_CACHE}"

# clear ccache if neccesery
if [ ${RESET_CACHE} = true ]; then
	echo "Clearing ccache"
	rm -rf .ccache || true
	rm -rf build/.ccache || true
fi

# Build the package on osx or linux
if [[ "$CI_NAME" == 'osx' || "$CI_NAME" == 'darwin' ]]; then
	echo "Start: osx or darwin"

	if [ ${USE_CCACHE} = true ]; then
		echo "Using ccache"		
		if [[ $(uname -m) == 'arm64' ]]; then
			BUILD_OPTION=""
		else
			BUILD_OPTION="-DUSE_PRECOMPILED_HEADERS=OFF -DCMAKE_OSX_DEPLOYMENT_TARGET=10.15"
			export CCACHE_COMPILERCHECK=content
		fi
	else
		echo "Not using ccache"
		BUILD_OPTION="-DUSE_CCACHE_CACHING=OFF"
	fi

	echo "Build option: ${BUILD_OPTION}"

	mkdir -p build/.ccache
	ls -a build/.ccache
	cd build
	ccache -z -d ./.ccache || true
	cmake -DPLATFORM=${PLATFORM} ${BUILD_OPTION} -DCMAKE_BUILD_TYPE=${BUILD_TYPE} -DCMAKE_INSTALL_PREFIX:PATH=/usr/local ../ || exit 2
	make -j $(sysctl -n hw.ncpu) || exit 3
	sudo cpack || exit 3
	ccache -sv -d ./.ccache || true
	exit 0;
	exit 1 || { echo "---> HyperHDR compilation failed! Abort"; exit 5; }

elif [[ $CI_NAME == *"mingw64_nt"* || "$CI_NAME" == 'windows_nt' ]]; then
	echo "Start: windows"	
	echo "Number of cores: $NUMBER_OF_PROCESSORS"

	if [ ${USE_CCACHE} = true ]; then
		echo "Using ccache"
		BUILD_OPTION="${ARCHIVE_OPTION}"
	else
		echo "Not using ccache"
		BUILD_OPTION="-DUSE_CCACHE_CACHING=OFF ${ARCHIVE_OPTION}"
	fi

	if [[ $CI_TYPE == "github_action" ]]; then
		export CCACHE_COMPILERCHECK=content
		export CCACHE_NOCOMPRESS=true
		BUILD_OPTION="${BUILD_OPTION} -DCMAKE_GITHUB_ACTION=ON"
	else
		BUILD_OPTION="${BUILD_OPTION} -DCMAKE_GITHUB_ACTION=OFF"
	fi

	echo "Build option: ${BUILD_OPTION}"

	mkdir -p build/.ccache

	cd build
	cmake -G "Visual Studio 17 2022" ${BUILD_OPTION} -A x64 -DPLATFORM=${PLATFORM} -DCMAKE_BUILD_TYPE=${BUILD_TYPE} ../ || exit 2
	./ccache.exe -zp || true
	cmake --build . --target package --config Release -- -nologo -v:m -maxcpucount || exit 3
	./ccache.exe -sv || true

	exit 0;

elif [[ "$CI_NAME" == 'linux' ]]; then
	echo "Compile Hyperhdr with DOCKER_IMAGE = ${DOCKER_IMAGE}, DOCKER_TAG = ${DOCKER_TAG} and friendly name DOCKER_NAME = ${DOCKER_NAME}"
	
	# Debug: Show repository information
	echo "GITHUB_REPOSITORY = ${GITHUB_REPOSITORY}"
	echo "Checking if this is the original awawa-dev/HyperHDR repository..."
	# set GitHub Container Registry url - use public images for forks
	if [[ "$GITHUB_REPOSITORY" == "awawa-dev/HyperHDR" ]]; then
		echo "Using private GitHub Container Registry for original repository"
		REGISTRY_URL="ghcr.io/awawa-dev/${DOCKER_IMAGE}"
	else
		echo "Using public Docker images for forked repository: ${GITHUB_REPOSITORY}"
		# Use public Docker images for forks
		case "${DOCKER_TAG}" in
			"bullseye")
				REGISTRY_URL="debian:bullseye-slim"
				;;
			"bookworm")
				REGISTRY_URL="debian:bookworm-slim"
				;;
			"jammy")
				REGISTRY_URL="ubuntu:jammy"
				;;
			"noble")
				REGISTRY_URL="ubuntu:noble"
				;;
			"oracular")
				REGISTRY_URL="ubuntu:oracular"
				;;
			"Fedora_41")
				REGISTRY_URL="fedora:41"
				;;
			"ArchLinux")
				REGISTRY_URL="archlinux:latest"
				;;
			*)
				REGISTRY_URL="ubuntu:latest"
				;;
		esac
	fi
	
	# take ownership of deploy dir
	mkdir -p ${CI_BUILD_DIR}/deploy
	mkdir -p .ccache

	if [ ${USE_CCACHE} = true ]; then
		echo "Using ccache"
		BUILD_OPTION="${ARCHIVE_OPTION}"
		cache_env="export CCACHE_DIR=/.ccache && ccache -z"
		ls -a .ccache
	else
		echo "Not using ccache"		
		BUILD_OPTION="-DUSE_CCACHE_CACHING=OFF ${ARCHIVE_OPTION}"
		cache_env="true"
	fi

	if [[ $DOCKER_IMAGE == *"armv6l"* ]] && [[ $CI_TYPE == "github_action" ]]; then
		BUILD_OPTION="-DOVERRIDE_ARCHITECTURE=armv6l ${BUILD_OPTION}"			fi
	
	echo "Build option: ${BUILD_OPTION}, ccache: ${cache_env}"

	if [[ "$DOCKER_TAG" == "ArchLinux" ]]; then
		echo "Arch Linux detected"
		cp cmake/linux/arch/* .
		chmod -R a+rw ${CI_BUILD_DIR}/deploy
		versionFile=`cat version`
		executeCommand="GLIBC_VER=\\\$(ldd --version | head -1 | sed 's/.*\\([0-9]\\+\\.[0-9]\\+\\).*/\\1/') && echo \"GLIBC version: \\\$GLIBC_VER\" && sed -i \"s/{GLIBC_VERSION}/\\\$GLIBC_VER/\" PKGBUILD && makepkg"
		echo ${executeCommand}
		sed -i "s/{VERSION}/${versionFile}/" PKGBUILD
		if [ ${USE_CCACHE} = true ]; then
			sed -i "s/{BUILD_OPTION}/${BUILD_OPTION} -DUSE_PRECOMPILED_HEADERS=OFF/" PKGBUILD
		else
			sed -i "s/{BUILD_OPTION}/${BUILD_OPTION}/" PKGBUILD
		fi
		chmod -R a+rw ${CI_BUILD_DIR}/.ccache
	else
		executeCommand="cd build && ( cmake ${BUILD_OPTION} -DPLATFORM=${PLATFORM} -DCMAKE_BUILD_TYPE=${BUILD_TYPE} -DDEBIAN_NAME_TAG=${DOCKER_TAG} ../ || exit 2 )"
		executeCommand+=" && ( make -j $(nproc) package || exit 3 )"
	fi	# run docker	echo "Final Docker configuration:"
	if [[ "$GITHUB_REPOSITORY" == "awawa-dev/HyperHDR" ]]; then
		# Use pre-built containers for original repository
		echo "Using pre-built container for original repository"
		DOCKER_IMAGE_FULL="$REGISTRY_URL:$DOCKER_TAG"
		INSTALL_DEPS=""
	else
		# Use public images and install dependencies for forks
		echo "Using public image with dependency installation for fork"
		DOCKER_IMAGE_FULL="$REGISTRY_URL"
		case "${DOCKER_TAG}" in			"bullseye"|"bookworm")
				INSTALL_DEPS="apt-get update && apt-get install -y build-essential cmake git pkg-config libqt5serialport5-dev qtbase5-dev libqt5sql5-sqlite libqt5svg5-dev libqt5x11extras5-dev libusb-1.0-0-dev python3-dev libxrandr-dev libxrender-dev libavahi-client-dev libssl-dev libpulse-dev libgl1-mesa-dev libturbojpeg0-dev libasound2-dev libqt5charts5-dev ccache"
				;;			"jammy"|"noble"|"oracular")
				INSTALL_DEPS="apt-get update && apt-get install -y build-essential cmake git pkg-config libqt5serialport5-dev qtbase5-dev libqt5sql5-sqlite libqt5svg5-dev libusb-1.0-0-dev python3-dev libxrandr-dev libxrender-dev libavahi-client-dev libssl-dev libpulse-dev libgl1-mesa-dev libturbojpeg0-dev libasound2-dev libqt5charts5-dev ccache"
				;;			"Fedora_41")
				INSTALL_DEPS="dnf install -y gcc gcc-c++ cmake git pkgconfig qt5-qtbase-devel qt5-qtserialport-devel libusb1-devel python3-devel libXrandr-devel avahi-devel openssl-devel pulseaudio-libs-devel mesa-libGL-devel turbojpeg-devel alsa-lib-devel qt5-qtcharts-devel qt5-qtsvg-devel ccache"
				;;			"ArchLinux")
				INSTALL_DEPS="pacman -Syu --noconfirm base-devel cmake git pkgconf qt5-base qt5-serialport qt5-svg libusb python libxrandr avahi openssl pulseaudio mesa libjpeg-turbo alsa-lib qt5-charts ccache"
				;;			*)
				INSTALL_DEPS="apt-get update && apt-get install -y build-essential cmake git pkg-config ccache"
				;;esac
	fi
		echo "About to run Docker with image: $DOCKER_IMAGE_FULL"
	echo "Install dependencies command: $INSTALL_DEPS"
		# Final safety check: ensure we're not accidentally trying to use private registry in a fork
	if [[ "$GITHUB_REPOSITORY" != "awawa-dev/HyperHDR" ]] && [[ "$DOCKER_IMAGE_FULL" == *"ghcr.io/awawa-dev"* ]]; then
		echo "ERROR: Detected attempt to use private registry in forked repository!"
		echo "Forcing fallback to public Ubuntu image..."
		DOCKER_IMAGE_FULL="ubuntu:latest"
		INSTALL_DEPS="apt-get update && apt-get install -y build-essential cmake git pkg-config libqt5serialport5-dev qtbase5-dev libqt5sql5-sqlite libqt5svg5-dev libusb-1.0-0-dev python3-dev libxrandr-dev libxrender-dev libavahi-client-dev libssl-dev libpulse-dev libgl1-mesa-dev libturbojpeg0-dev libasound2-dev libqt5charts5-dev ccache"
	fi
	
	# Handle Arch Linux special case (needs non-root user for makepkg)
	if [[ "$DOCKER_TAG" == "ArchLinux" ]]; then
		echo "Arch Linux build - creating non-root user for makepkg"
		docker run --rm \
		-v "${CI_BUILD_DIR}/.ccache:/.ccache" \
		-v "${CI_BUILD_DIR}/deploy:/deploy" \
		-v "${CI_BUILD_DIR}:/source:ro" \
		$DOCKER_IMAGE_FULL \
		/bin/bash -c "${INSTALL_DEPS} && 
		useradd -m -s /bin/bash builder && 
		echo 'builder ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers && 
		${cache_env} && 
		cd / && mkdir -p hyperhdr && cp -rf /source/. /hyperhdr && 
		chown -R builder:builder /hyperhdr && 
		chown -R builder:builder /.ccache && 
		chown -R builder:builder /deploy && 
		cd /hyperhdr && 
		su builder -c '${executeCommand}' &&
		(cp /hyperhdr/Hyper*.zst /deploy/ 2>/dev/null || : ) &&
		(su builder -c 'ccache -sv' || true) &&
		exit 0;
		exit 1 " || { echo "---> HyperHDR compilation failed! Abort"; exit 5; }	else
		docker run --rm \
		-v "${CI_BUILD_DIR}/.ccache:/.ccache" \
		-v "${CI_BUILD_DIR}/deploy:/deploy" \
		-v "${CI_BUILD_DIR}:/source:ro" \
		$DOCKER_IMAGE_FULL \
		/bin/bash -c "${INSTALL_DEPS} && ${cache_env} && cd / && mkdir -p hyperhdr && cp -rf /source/. /hyperhdr &&
		cd /hyperhdr && mkdir build && (${executeCommand}) &&
		(cp /hyperhdr/build/bin/h* /deploy/ 2>/dev/null || : ) &&
		(cp /hyperhdr/build/Hyper* /deploy/ 2>/dev/null || : ) &&
		(cp /hyperhdr/Hyper*.zst /deploy/ 2>/dev/null || : ) &&
		(ccache -sv || true) &&
		exit 0;
		exit 1 " || { echo "---> HyperHDR compilation failed! Abort"; exit 5; }
	fi
	
	# overwrite file owner to current user
	sudo chown -fR $(stat -c "%U:%G" ${CI_BUILD_DIR}/deploy) ${CI_BUILD_DIR}/deploy
fi
