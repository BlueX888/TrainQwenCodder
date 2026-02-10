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

let starCount = 0;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 初始化星形计数器
  starCount = 0;
  
  // 使用Graphics绘制青色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.lineStyle(2, 0x00cccc, 1);
  
  // 绘制五角星
  const starPoints = [];
  const outerRadius = 30;
  const innerRadius = 15;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    starPoints.push(
      32 + radius * Math.cos(angle),
      32 + radius * Math.sin(angle)
    );
  }
  
  graphics.beginPath();
  graphics.moveTo(starPoints[0], starPoints[1]);
  for (let i = 2; i < starPoints.length; i += 2) {
    graphics.lineTo(starPoints[i], starPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
  
  // 创建定时器事件，每1.5秒生成一个星形
  timerEvent = this.time.addEvent({
    delay: 1500, // 1.5秒
    callback: generateStar,
    callbackScope: this,
    loop: true
  });
  
  // 添加文本显示当前星形数量
  this.starCountText = this.add.text(10, 10, 'Stars: 0 / 8', {
    fontSize: '24px',
    color: '#00ffff'
  });
}

function generateStar() {
  // 检查是否已达到最大数量
  if (starCount >= 8) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    return;
  }
  
  // 生成随机位置（确保星形完全在屏幕内）
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
  // 创建星形图像
  const star = this.add.image(x, y, 'star');
  
  // 添加缩放动画效果
  this.tweens.add({
    targets: star,
    scale: { from: 0, to: 1 },
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 增加计数
  starCount++;
  
  // 更新文本显示
  this.starCountText.setText(`Stars: ${starCount} / 8`);
}

// 创建游戏实例
new Phaser.Game(config);