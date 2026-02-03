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
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制三角形（等边三角形）
  // 中心点在 (50, 50)，边长约 80
  graphics.beginPath();
  graphics.moveTo(50, 10);      // 顶点
  graphics.lineTo(10, 90);       // 左下角
  graphics.lineTo(90, 90);       // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  
  // 销毁 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建使用三角形纹理的 Sprite
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 设置三角形的原点为中心
  triangle.setOrigin(0.5, 0.5);
  
  // 创建缩放 Tween 动画
  this.tweens.add({
    targets: triangle,           // 动画目标对象
    scaleX: 0.32,               // X 轴缩放到 32%
    scaleY: 0.32,               // Y 轴缩放到 32%
    duration: 2000,             // 单程持续时间 2 秒
    yoyo: true,                 // 启用 yoyo 模式，动画结束后反向播放（实现恢复效果）
    loop: -1,                   // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut'      // 缓动函数，使动画更平滑
  });
  
  // 添加提示文本
  const text = this.add.text(400, 500, '三角形缩放动画：1.0 → 0.32 → 1.0 (4秒循环)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5, 0.5);
}

// 创建 Phaser 游戏实例
new Phaser.Game(config);