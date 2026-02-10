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
  
  // 绘制三角形（等边三角形）
  // 中心点在 (50, 50)，边长约 80
  graphics.beginPath();
  graphics.moveTo(50, 10);      // 顶点
  graphics.lineTo(10, 90);      // 左下
  graphics.lineTo(90, 90);      // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建三角形精灵并居中显示
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放 Tween 动画
  this.tweens.add({
    targets: triangle,           // 动画目标
    scale: 0.8,                  // 缩放到 80%
    duration: 500,               // 持续时间 0.5 秒
    yoyo: true,                  // 往返效果（缩小后自动恢复）
    loop: -1,                    // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut'       // 缓动函数，使动画更平滑
  });
  
  // 添加提示文本
  const text = this.add.text(400, 500, '三角形循环缩放动画', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);