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
  // 不需要预加载外部资源
}

function create() {
  // 创建青色椭圆
  const ellipse = this.add.ellipse(100, 300, 80, 50, 0x00ffff);
  
  // 创建补间动画：从左移动到右，然后往返循环
  this.tweens.add({
    targets: ellipse,           // 动画目标对象
    x: 700,                     // 目标 x 坐标（从初始位置100移动到700）
    duration: 2500,             // 持续时间 2.5 秒
    yoyo: true,                 // 启用往返效果（到达终点后反向播放）
    loop: -1,                   // 无限循环（-1 表示永久循环）
    ease: 'Linear'              // 线性缓动函数，保持匀速移动
  });
  
  // 添加文字说明
  this.add.text(10, 10, 'Cyan Ellipse Tween Animation\nMoving left-right in 2.5s loop', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);