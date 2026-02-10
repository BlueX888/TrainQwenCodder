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
  // 使用 Graphics 绘制橙色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillCircle(50, 50, 40); // 圆心在 (50, 50)，半径 40
  
  // 为了让旋转效果更明显，添加一个标记点
  graphics.fillStyle(0xffffff, 1); // 白色标记
  graphics.fillCircle(50, 20, 8); // 在圆形顶部添加小白点
  
  // 生成纹理
  graphics.generateTexture('orangeCircle', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建精灵对象
  const circle = this.add.sprite(400, 300, 'orangeCircle');
  
  // 创建旋转动画
  this.tweens.add({
    targets: circle,        // 动画目标
    angle: 360,             // 旋转到 360 度
    duration: 1000,         // 持续时间 1 秒
    ease: 'Linear',         // 线性缓动，保持匀速旋转
    repeat: -1,             // 无限循环 (-1 表示永久重复)
    onRepeat: function() {
      // 每次循环重置角度，避免累积
      circle.angle = 0;
    }
  });
  
  // 添加文字提示
  this.add.text(400, 500, '橙色圆形旋转动画 (1秒/圈)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);