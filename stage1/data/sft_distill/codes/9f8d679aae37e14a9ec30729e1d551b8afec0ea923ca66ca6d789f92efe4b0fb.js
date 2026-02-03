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
  // 使用 Graphics 绘制绿色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  graphics.fillCircle(50, 50, 40); // 在中心绘制半径为 40 的圆
  
  // 生成纹理
  graphics.generateTexture('greenCircle', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建使用该纹理的 Sprite
  const circle = this.add.sprite(400, 300, 'greenCircle');
  
  // 创建旋转动画
  this.tweens.add({
    targets: circle,        // 动画目标对象
    angle: 360,             // 旋转到 360 度
    duration: 500,          // 持续时间 0.5 秒（500 毫秒）
    ease: 'Linear',         // 线性缓动，保持匀速旋转
    repeat: -1,             // -1 表示无限循环
    onRepeat: function() {
      // 每次循环重置角度，避免角度累积
      circle.angle = 0;
    }
  });
  
  // 添加说明文字
  this.add.text(400, 500, '绿色圆形旋转动画 (0.5秒/圈)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);