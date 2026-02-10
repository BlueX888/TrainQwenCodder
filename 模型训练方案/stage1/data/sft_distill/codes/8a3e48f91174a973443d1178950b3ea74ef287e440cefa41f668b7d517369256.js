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
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制三角形（三个顶点坐标）
  graphics.beginPath();
  graphics.moveTo(0, -60);    // 顶点
  graphics.lineTo(-50, 40);   // 左下角
  graphics.lineTo(50, 40);    // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('triangle', 100, 100);
  
  // 销毁 Graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建使用三角形纹理的 Sprite
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 设置初始透明度为 0（完全透明）
  triangle.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: triangle,           // 动画目标对象
    alpha: 1,                    // 目标透明度为 1（完全不透明）
    duration: 4000,              // 持续时间 4 秒（4000 毫秒）
    ease: 'Linear',              // 线性缓动
    loop: -1,                    // 无限循环
    yoyo: false                  // 不反向播放（如果需要淡入淡出效果可设为 true）
  });
  
  // 添加提示文本
  const text = this.add.text(400, 500, '三角形渐变动画（4秒循环）', {
    fontSize: '20px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

// 创建 Phaser 游戏实例
new Phaser.Game(config);