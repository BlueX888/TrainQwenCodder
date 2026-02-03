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
  // 无需预加载外部资源
}

function create() {
  // 方法1：使用 Ellipse 游戏对象（推荐）
  const ellipse = this.add.ellipse(400, 300, 150, 80, 0x00ffff);
  
  // 添加一个标记点，方便观察旋转效果
  const marker = this.add.circle(400, 300, 8, 0xff0000);
  marker.setPosition(400, 220); // 放在椭圆顶部
  
  // 将标记点设置为椭圆的子对象，使其跟随旋转
  ellipse.add(marker);
  marker.x = 0;
  marker.y = -40;
  
  // 创建旋转动画
  this.tweens.add({
    targets: ellipse,
    angle: 360,           // 旋转到 360 度
    duration: 2500,       // 持续 2.5 秒
    ease: 'Linear',       // 线性缓动，保持匀速旋转
    repeat: -1,           // -1 表示无限循环
    onRepeat: function() {
      // 每次循环重置角度，避免数值累积
      ellipse.angle = 0;
    }
  });
  
  // 添加文字说明
  this.add.text(400, 500, '青色椭圆旋转动画 (2.5秒/圈)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);