const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制等边三角形（中心点为原点）
  graphics.beginPath();
  graphics.moveTo(0, -40);      // 顶点
  graphics.lineTo(-35, 30);     // 左下
  graphics.lineTo(35, 30);      // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 70, 70);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 保存原始位置
  const originalX = triangle.x;
  const originalY = triangle.y;
  
  // 创建抖动动画
  this.tweens.add({
    targets: triangle,
    duration: 2500,
    repeat: -1, // 无限循环
    yoyo: false,
    onUpdate: (tween, target) => {
      // 在每帧更新时产生随机偏移，模拟抖动效果
      const progress = tween.progress;
      const intensity = 10; // 抖动强度
      
      // 使用正弦波叠加随机值创建抖动
      const shake = Math.sin(progress * Math.PI * 20) * intensity;
      target.x = originalX + shake + Phaser.Math.Between(-3, 3);
      target.y = originalY + shake + Phaser.Math.Between(-3, 3);
    },
    onRepeat: () => {
      // 每次循环重置位置
      triangle.x = originalX;
      triangle.y = originalY;
    }
  });
  
  // 添加文字说明
  this.add.text(400, 500, '灰色三角形抖动动画 (2.5秒循环)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);