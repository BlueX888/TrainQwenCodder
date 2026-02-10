const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制三角形（等边三角形）
  const triangleSize = 100;
  graphics.beginPath();
  graphics.moveTo(triangleSize, 0); // 顶点
  graphics.lineTo(0, triangleSize * Math.sqrt(3) / 2); // 左下角
  graphics.lineTo(triangleSize * 2, triangleSize * Math.sqrt(3) / 2); // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', triangleSize * 2, triangleSize * Math.sqrt(3) / 2);
  
  // 销毁 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建三角形精灵并居中显示
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 设置三角形的锚点为中心
  triangle.setOrigin(0.5, 0.5);
  
  // 创建缩放动画
  this.tweens.add({
    targets: triangle,
    scaleX: 0.24, // 缩放到 24%
    scaleY: 0.24, // 缩放到 24%
    duration: 3000, // 持续 3 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 动画结束后反向播放（恢复原始大小）
    loop: -1 // 无限循环 (-1 表示永久循环)
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '三角形缩放动画\n3秒缩放到24%后恢复', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5, 0.5);
}

new Phaser.Game(config);