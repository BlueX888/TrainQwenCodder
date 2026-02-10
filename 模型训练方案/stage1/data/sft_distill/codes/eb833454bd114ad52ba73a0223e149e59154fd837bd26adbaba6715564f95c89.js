const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

let stars = [];
let starTimer = null;
const MAX_STARS = 8;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建青色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制一个星形到 graphics
  const centerX = 25;
  const centerY = 25;
  const points = 5;
  const innerRadius = 10;
  const outerRadius = 25;
  
  graphics.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 50, 50);
  graphics.destroy();
  
  // 创建定时器，每1.5秒生成一个星形
  starTimer = this.time.addEvent({
    delay: 1500, // 1.5秒
    callback: spawnStar,
    callbackScope: this,
    loop: true
  });
}

function spawnStar() {
  // 检查是否已达到最大数量
  if (stars.length >= MAX_STARS) {
    // 停止定时器
    if (starTimer) {
      starTimer.remove();
      starTimer = null;
    }
    return;
  }
  
  // 在随机位置生成星形
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
  const star = this.add.image(x, y, 'star');
  stars.push(star);
  
  console.log(`生成第 ${stars.length} 个星形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);