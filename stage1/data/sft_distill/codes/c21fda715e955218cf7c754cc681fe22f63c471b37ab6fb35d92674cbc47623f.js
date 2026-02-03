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
  // 不需要加载外部资源
}

function create() {
  // 创建一个青色椭圆
  // 参数：x, y, 宽度, 高度, 填充颜色
  const ellipse = this.add.ellipse(100, 300, 80, 50, 0x00ffff);
  
  // 创建补间动画
  this.tweens.add({
    targets: ellipse,           // 动画目标对象
    x: 700,                     // 目标 x 坐标（从左到右）
    duration: 2500,             // 动画时长 2.5 秒
    ease: 'Linear',             // 线性缓动
    yoyo: true,                 // 往返效果（到达终点后反向播放）
    loop: -1                    // 无限循环（-1 表示永久循环）
  });
}

new Phaser.Game(config);