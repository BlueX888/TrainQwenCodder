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
  const hexagonRadius = 50;
  const hexagonSides = 6;
  const centerX = 64;
  const centerY = 64;
  
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(3, 0x00aa00, 1);
  
  // 计算六边形顶点
  graphics.beginPath();
  for (let i = 0; i < hexagonSides; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 旋转30度使六边形平顶
    const x = centerX + hexagonRadius * Math.cos(angle);
    const y = centerY + hexagonRadius * Math.sin(angle);
    
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
  graphics.generateTexture('hexagon', 128, 128);
  graphics.destroy();
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(400, 200, 'hexagon');
  
  // 创建弹跳动画
  // 使用 yoyo 模式实现上下弹跳，配合 Bounce ease 实现弹跳效果
  this.tweens.add({
    targets: hexagon,
    y: 400, // 弹跳到的目标位置
    duration: 750, // 单程 0.75 秒
    ease: 'Bounce.easeOut', // 弹跳缓动
    yoyo: true, // 往返运动
    repeat: -1, // 无限循环
    hold: 0, // 到达目标位置后不停留
    repeatDelay: 0 // 重复之间无延迟
  });
  
  // 添加说明文字
  this.add.text(400, 550, '绿色六边形弹跳动画 (1.5秒循环)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);