pushd ~/GitHub/alphas/alpha-copious/
pwd
node tools/dependencies.js
popd
node test
cp data/alpha_staging_diffs.json ../../data/
