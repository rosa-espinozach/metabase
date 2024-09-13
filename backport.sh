git reset HEAD~1
rm ./backport.sh
git cherry-pick d8786ffc632f8781950539f219605a02b6e8e620
echo 'Resolve conflicts and force push this branch'
