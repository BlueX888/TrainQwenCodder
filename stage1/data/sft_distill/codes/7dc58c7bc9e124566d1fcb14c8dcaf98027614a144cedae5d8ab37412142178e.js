const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillEllipse(0, 0, 80, 50); // 椭圆：中心点(0,0)，宽80，高50
  
  // 将 graphics 生成为纹理，以便应用到精灵上
  graphics.generateTexture('pinkEllipse', 80, 50);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建精灵并设置初始位置（左侧）
  const ellipse = this.add.sprite(100, 300, 'pinkEllipse');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: ellipse,        // 动画目标对象
    x: 700,                  // 目标 x 坐标（右侧）
    duration: 1000,          // 持续时间 1 秒（1000毫秒）
    yoyo: true,              // 往返效果：到达终点后反向播放
    repeat: -1,              // 无限循环（-1 表示永久重复）
    ease: 'Linear'           // 线性缓动，匀速移动
  });
}

new Phaser.Game(config);