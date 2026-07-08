
src=$1
dst=$2

# separate files for each type, because we are anticipating special handling

echo "running single html file compresion" $src $dst
terser ${src} --compress --mangle --output ${dst}
wait
