const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制三角形（等边三角形）
  const triangleSize = 60;
  graphics.beginPath();
  graphics.moveTo(0, -triangleSize / 2);
  graphics.lineTo(-triangleSize / 2, triangleSize / 2);
  graphics.lineTo(triangleSize / 2, triangleSize / 2);
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', triangleSize, triangleSize);
  graphics.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 记录初始位置
  const originalX = triangle.x;
  const originalY = triangle.y;
  
  // 创建抖动动画
  // 使用 timeline 来创建复杂的抖动效果
  const shakeIntensity = 10; // 抖动强度
  
  this.tweens.add({
    targets: triangle,
    duration: 2500, // 2.5 秒
    ease: 'Linear',
    repeat: -1, // 无限循环
    onUpdate: (tween) => {
      // 在动画更新时随机偏移位置
      const progress = tween.progress;
      
      // 使用正弦波模拟抖动衰减效果
      const intensity = Math.sin(progress * Math.PI * 20) * shakeIntensity;
      
      triangle.x = originalX + Phaser.Math.Between(-intensity, intensity);
      triangle.y = originalY + Phaser.Math.Between(-intensity, intensity);
    },
    onRepeat: () => {
      // 每次循环重置位置
      triangle.x = originalX;
      triangle.y = originalY;
    }
  });
  
  // 添加说明文字
  const text = this.add.text(400, 500, '灰色三角形抖动动画 (2.5秒循环)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);