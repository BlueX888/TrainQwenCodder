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
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 设置圆形样式（蓝色填充）
  graphics.fillStyle(0x4a90e2, 1);
  
  // 在中心位置绘制圆形，半径为 80 像素
  graphics.fillCircle(0, 0, 80);
  
  // 设置圆形位置到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 创建缩放动画
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    scale: 0.8,                  // 缩放到 80%
    duration: 1250,              // 单程时长 1.25 秒
    yoyo: true,                  // 启用往返效果（缩小后恢复）
    loop: -1,                    // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut'       // 使用正弦缓动函数，使动画更平滑
  });
  
  // 添加提示文本
  const text = this.add.text(400, 500, '圆形缩放动画（2.5秒循环）', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
}

// 创建 Phaser 游戏实例
new Phaser.Game(config);