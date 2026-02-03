const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建六边形纹理
  const graphics = this.add.graphics();
  
  // 绘制绿色六边形
  const hexRadius = 50;
  const hexCenterX = 60;
  const hexCenterY = 60;
  
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(3, 0x00aa00, 1);
  
  // 绘制六边形路径
  graphics.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = hexCenterX + hexRadius * Math.cos(angle);
    const y = hexCenterY + hexRadius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 120, 120);
  graphics.destroy();
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(400, 200, 'hexagon');
  
  // 创建弹跳动画
  // 使用 Tween 实现弹跳效果
  this.tweens.add({
    targets: hexagon,
    y: 450, // 弹跳到的目标位置
    duration: 750, // 下落时间 0.75 秒
    ease: 'Quad.easeIn', // 下落时加速
    yoyo: true, // 返回原位置
    yoyoEase: 'Bounce.easeOut', // 返回时使用弹跳缓动
    repeat: -1, // 无限循环
    repeatDelay: 0 // 无延迟
  });
  
  // 添加说明文字
  this.add.text(400, 550, '绿色六边形弹跳动画（1.5秒循环）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);