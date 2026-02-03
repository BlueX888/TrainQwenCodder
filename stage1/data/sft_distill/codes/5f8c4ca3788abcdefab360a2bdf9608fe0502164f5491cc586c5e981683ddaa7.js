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
  // 创建黄色椭圆
  const ellipse = this.add.ellipse(100, 300, 80, 50, 0xffff00);
  
  // 创建补间动画
  this.tweens.add({
    targets: ellipse,           // 动画目标对象
    x: 700,                     // 目标 x 坐标（从左到右）
    duration: 1000,             // 动画持续时间 1 秒
    ease: 'Linear',             // 线性缓动
    yoyo: true,                 // 往返效果（到达终点后反向播放）
    repeat: -1                  // 无限循环（-1 表示永久重复）
  });
  
  // 添加文字说明
  this.add.text(10, 10, 'Yellow Ellipse Tween Animation\nMoving left to right with yoyo loop', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);