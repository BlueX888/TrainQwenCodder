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

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建紫色圆形
  const circle = this.add.graphics();
  circle.fillStyle(0x9966ff, 1); // 紫色
  circle.fillCircle(0, 0, 30); // 以中心点绘制半径30的圆
  
  // 设置初始位置（左侧）
  circle.x = 100;
  circle.y = 300;
  
  // 创建补间动画
  this.tweens.add({
    targets: circle,
    x: 700, // 移动到右侧
    duration: 2500, // 2.5秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 往返效果
    repeat: -1 // 无限循环
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Purple Circle Tween Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Looping left-right in 2.5 seconds', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);