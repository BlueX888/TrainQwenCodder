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
  // 方法1: 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色星形
  graphics.lineStyle(2, 0xffa500, 1); // 橙色描边
  
  // 绘制五角星
  const centerX = 400;
  const centerY = 300;
  const outerRadius = 60;
  const innerRadius = 25;
  const points = 5;
  
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
  graphics.strokePath();
  
  // 方法2: 使用 Phaser 内置的 Star GameObject（更简洁）
  const star = this.add.star(400, 300, 5, 25, 60, 0xffff00);
  star.setStrokeStyle(2, 0xffa500);
  
  // 创建缩放 Tween 动画
  this.tweens.add({
    targets: star,
    scaleX: 0.64,  // 缩放到 64%
    scaleY: 0.64,
    duration: 500,  // 0.5 秒
    yoyo: true,     // 来回播放（缩小后再放大）
    loop: -1,       // 无限循环
    ease: 'Sine.easeInOut'  // 平滑的缓动效果
  });
  
  // 添加提示文本
  this.add.text(400, 550, 'Star scaling animation (64% - 100% loop)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);