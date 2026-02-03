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

// 星形数组，用于跟踪已生成的星形
let stars = [];

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建蓝色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  
  // 绘制星形路径
  const points = 5; // 五角星
  const innerRadius = 20;
  const outerRadius = 50;
  const angle = Math.PI / points;
  
  graphics.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = 50 + Math.cos(i * angle - Math.PI / 2) * radius;
    const y = 50 + Math.sin(i * angle - Math.PI / 2) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('blueStar', 100, 100);
  graphics.destroy();
  
  // 创建定时器，每1.5秒触发一次
  const timerEvent = this.time.addEvent({
    delay: 1500, // 1.5秒
    callback: spawnStar,
    callbackScope: this,
    loop: true
  });
  
  // 存储定时器引用，以便在达到上限时停止
  this.starTimer = timerEvent;
}

function spawnStar() {
  // 检查是否已经生成了3个星形
  if (stars.length >= 3) {
    // 停止定时器
    if (this.starTimer) {
      this.starTimer.remove();
      console.log('已生成3个星形，停止生成');
    }
    return;
  }
  
  // 在随机位置生成星形
  const x = Phaser.Math.Between(50, 750); // 留出边界空间
  const y = Phaser.Math.Between(50, 550);
  
  const star = this.add.image(x, y, 'blueStar');
  star.setScale(0.8); // 稍微缩小一点
  
  // 添加到星形数组
  stars.push(star);
  
  console.log(`生成第 ${stars.length} 个星形，位置: (${x}, ${y})`);
}

// 创建游戏实例
new Phaser.Game(config);