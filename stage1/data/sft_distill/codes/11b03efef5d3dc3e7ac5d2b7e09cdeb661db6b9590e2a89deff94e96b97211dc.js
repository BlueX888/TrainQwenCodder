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
  // 使用 Graphics 绘制橙色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillCircle(50, 50, 50); // 绘制半径为 50 的圆形
  
  // 生成纹理
  graphics.generateTexture('orangeCircle', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建 Sprite 对象并放置在屏幕中心
  const circle = this.add.sprite(400, 300, 'orangeCircle');
  
  // 创建旋转动画
  this.tweens.add({
    targets: circle,           // 动画目标对象
    angle: 360,                // 旋转到 360 度
    duration: 1000,            // 持续时间 1 秒
    ease: 'Linear',            // 线性缓动，保持匀速旋转
    repeat: -1,                // -1 表示无限循环
    onRepeat: function() {
      // 每次循环重置角度，避免累积
      circle.angle = 0;
    }
  });
}

new Phaser.Game(config);