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
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x4a90e2, 1);
  
  // 绘制圆形（中心点在 0,0，半径 50）
  graphics.fillCircle(0, 0, 50);
  
  // 将圆形定位到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 创建缩放动画
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    scaleX: 0.48,               // X 轴缩放到 48%
    scaleY: 0.48,               // Y 轴缩放到 48%
    duration: 2000,             // 动画持续 2 秒
    yoyo: true,                 // 动画结束后反向播放（恢复原始大小）
    loop: -1,                   // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut'      // 使用正弦缓动函数使动画更平滑
  });
  
  // 添加文字说明
  this.add.text(400, 500, 'Circle scaling to 48% and back (2s loop)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);