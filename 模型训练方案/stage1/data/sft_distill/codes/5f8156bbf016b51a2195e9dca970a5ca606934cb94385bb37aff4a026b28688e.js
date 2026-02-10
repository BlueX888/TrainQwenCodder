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
  // 使用 Graphics 绘制绿色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  graphics.fillCircle(50, 50, 40); // 在 (50, 50) 位置绘制半径 40 的圆
  
  // 添加一个白色标记线，用于更明显地看到旋转效果
  graphics.lineStyle(4, 0xffffff, 1);
  graphics.lineBetween(50, 50, 90, 50);
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('greenCircle', 100, 100);
  graphics.destroy(); // 销毁 Graphics 对象，因为已经生成了纹理
  
  // 创建 Sprite 对象并放置在屏幕中央
  const circle = this.add.sprite(400, 300, 'greenCircle');
  
  // 创建旋转动画
  this.tweens.add({
    targets: circle,           // 动画目标对象
    angle: 360,                // 旋转到 360 度
    duration: 500,             // 持续时间 0.5 秒
    repeat: -1,                // -1 表示无限循环
    ease: 'Linear'             // 线性缓动，保持匀速旋转
  });
  
  // 添加文字说明
  this.add.text(400, 500, '绿色圆形旋转动画 (0.5秒/圈)', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);