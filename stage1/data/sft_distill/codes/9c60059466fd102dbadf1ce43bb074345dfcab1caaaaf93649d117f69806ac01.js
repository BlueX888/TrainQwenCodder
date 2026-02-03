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
  // 使用 Graphics 绘制蓝色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillCircle(25, 25, 25); // 在中心绘制半径为 25 的圆
  
  // 生成纹理
  graphics.generateTexture('blueCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建精灵对象
  const circle = this.add.sprite(100, 300, 'blueCircle');
  
  // 创建补间动画
  this.tweens.add({
    targets: circle,
    x: 700, // 目标 x 坐标（右侧）
    duration: 500, // 持续时间 0.5 秒
    yoyo: true, // 往返效果
    loop: -1, // 无限循环（-1 表示永久循环）
    ease: 'Linear' // 线性缓动
  });
  
  // 添加文字说明
  this.add.text(300, 50, '蓝色圆形左右往返循环', {
    fontSize: '24px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);