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
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制圆形：圆心在 (0, 0)，半径为 50
  graphics.fillCircle(0, 0, 50);
  
  // 将 graphics 对象定位到屏幕中心
  graphics.setPosition(400, 300);
  
  // 创建缩放动画
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    scaleX: 0.24,               // X 轴缩放到 24%
    scaleY: 0.24,               // Y 轴缩放到 24%
    duration: 2000,             // 动画持续时间 2 秒
    yoyo: true,                 // 动画结束后反向播放（恢复原始大小）
    repeat: -1,                 // 无限循环 (-1 表示永久重复)
    ease: 'Linear'              // 线性缓动函数
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Circle Scale Animation (24% - 100%)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

// 创建 Phaser 游戏实例
new Phaser.Game(config);