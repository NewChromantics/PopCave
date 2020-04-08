#
# Copyright (C) The Android Open Source Project
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

cmake_minimum_required(VERSION 3.4.1)

# build native_app_glue as a static lib
set(${CMAKE_C_FLAGS}, "${CMAKE_C_FLAGS}")
add_library(native_app_glue STATIC
    ${ANDROID_NDK}/sources/android/native_app_glue/android_native_app_glue.c)

# now build app's shared lib
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=gnu++17 -Wall -Werror")

# Export ANativeActivity_onCreate(),
# Refer to: https://github.com/android-ndk/ndk/issues/381.
set(CMAKE_SHARED_LINKER_FLAGS
    "${CMAKE_SHARED_LINKER_FLAGS} -u ANativeActivity_onCreate")


add_library(PopH264 SHARED IMPORTED)
set_target_properties(PopH264 PROPERTIES IMPORTED_LOCATION /Volumes/Code/PopCave/PopCave.Android/app/src/main/cpp/${CMAKE_ANDROID_ARCH_ABI}/libPopH264.so)
#find_library(PopH264 "/Volumes/Code/PopCave/PopCave.Android/app/src/main/cpp/${CMAKE_ANDROID_ARCH_ABI}/libPopH264.so")

add_library(native-activity SHARED main.cpp)

# https://groups.google.com/forum/?fromgroups#!topic/adt-dev/nQobKd2Gl_8
# need to put so's into a jar
link_directories("Libs")
link_directories("")
link_directories("./")
#add_library(testlib SHARED IMPORTED)
#set_property(TARGET testlib PROPERTY IMPORTEDPopH264_LOCATION "libPopH264.so")
#TARGET_LINK_LIBRARIES(TARGET "-L./" testlib)
#target_link_directories(TARGET SHARED Libs)

target_include_directories(native-activity PRIVATE ${ANDROID_NDK}/sources/android/native_app_glue)


# add lib dependencies
target_link_libraries(native-activity
    android
    native_app_glue
    EGL
    GLESv1_CM
    log
        PopH264
  #"/Volumes/Code/PopCave/PopCave.Android/app/src/main/cpp/${CMAKE_ANDROID_ARCH_ABI}/libPopH264.so"
    )
