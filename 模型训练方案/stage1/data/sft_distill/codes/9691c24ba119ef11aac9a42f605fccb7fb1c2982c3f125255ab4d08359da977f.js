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

// 存储生成的星形
let stars = [];

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建蓝色星形纹理
  const graphics = this.add.graphics();
  
  // 绘制蓝色星形
  graphics.fillStyle(0x0066ff, 1);
  graphics.beginPath();
  
  // 绘制五角星
  const centerX = 25;
  const centerY = 25;
  const outerRadius = 20;
  const innerRadius = 10;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
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
  graphics.generateTexture('blueStar', 50, 50);
  graphics.destroy();
  
  // 创建定时器事件，每1.5秒触发一次
  this.time.addEvent({
    delay: 1500, // 1.5秒 = 1500毫秒
    callback: spawnStar,
    callbackScope: this,
    loop: true // 循环执行
  });
  
  // 添加提示文本
  this.add.text(10, 10, '每1.5秒生成蓝色星形\n最多3个', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function spawnStar() {
  // 检查当前星形数量
  if (stars.length < 3) {
    // 生成随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(100, 550);
    
    // 创建星形精灵
    const star = this.add.image(x, y, 'blueStar');
    
    // 添加到数组中
    stars.push(star);
    
    console.log(`生成第 ${stars.length} 个星形，位置: (${x}, ${y})`);
  } else {
    console.log('已达到最大数量(3个)，停止生成');
  }
}

new Phaser.Game(config);