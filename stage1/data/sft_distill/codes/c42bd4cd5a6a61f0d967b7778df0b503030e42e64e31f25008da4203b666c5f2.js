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
  // 创建紫色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillEllipse(0, 0, 80, 50); // 椭圆，中心点在(0,0)，宽80，高50
  
  // 将椭圆初始位置设置在左侧
  graphics.x = 100;
  graphics.y = 300; // 垂直居中
  
  // 创建补间动画
  this.tweens.add({
    targets: graphics,
    x: 700, // 移动到右侧
    duration: 4000, // 4秒
    yoyo: true, // 往返效果
    repeat: -1, // 无限循环 (-1 表示永久重复)
    ease: 'Linear' // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 50, '紫色椭圆左右往返循环', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);