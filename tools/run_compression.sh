
src=$1
dst=$2

echo "running compresions" $src $dst
cp -RT $src $dst
node ./tools/for_each_file_call $dst terser 