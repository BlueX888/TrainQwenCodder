const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建红色圆形
  const circle = this.add.graphics();
  circle.fillStyle(0xff0000, 1); // 红色，不透明
  circle.fillCircle(0, 0, 30); // 在原点绘制半径为30的圆
  
  // 设置初始位置（左侧）
  circle.x = 100;
  circle.y = 300;
  
  // 创建补间动画
  this.tweens.add({
    targets: circle,          // 动画目标对象
    x: 700,                   // 目标 x 坐标（右侧）
    duration: 2500,           // 动画时长 2.5 秒
    ease: 'Linear',           // 线性缓动
    yoyo: true,               // 启用往返效果（到达终点后反向播放）
    repeat: -1                // 无限循环（-1 表示永久重复）
  });
  
  // 添加提示文本
  this.add.text(400, 50, '红色圆形左右往返循环', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);