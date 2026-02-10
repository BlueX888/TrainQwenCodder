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
  // 使用 Graphics 绘制紫色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9932cc, 1); // 紫色
  graphics.fillCircle(25, 25, 25); // 在中心绘制半径为25的圆
  
  // 生成纹理
  graphics.generateTexture('purpleCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建精灵对象
  const circle = this.add.sprite(100, 300, 'purpleCircle');
  
  // 创建补间动画
  this.tweens.add({
    targets: circle,
    x: 700, // 目标 x 坐标（右侧位置）
    duration: 2500, // 2.5 秒 = 2500 毫秒
    yoyo: true, // 启用往返效果
    loop: -1, // 无限循环（-1 表示永久循环）
    ease: 'Linear' // 线性运动
  });
}

new Phaser.Game(config);