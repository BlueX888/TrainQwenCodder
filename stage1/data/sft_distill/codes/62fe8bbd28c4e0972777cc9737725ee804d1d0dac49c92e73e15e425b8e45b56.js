const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let triangleCount = 0;
let timerEvent = null;

function preload() {
  // 使用 Graphics 创建粉色三角形纹理
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(25, 0);      // 顶点
  graphics.lineTo(50, 43);     // 右下角
  graphics.lineTo(0, 43);      // 左下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('pinkTriangle', 50, 43);
  graphics.destroy();
}

function create() {
  // 添加标题文本
  this.add.text(10, 10, '每3秒生成一个粉色三角形（最多5个）', {
    fontSize: '18px',
    color: '#ffffff'
  });
  
  // 显示计数器
  const countText = this.add.text(10, 40, '三角形数量: 0/5', {
    fontSize: '16px',
    color: '#ffff00'
  });
  
  // 创建定时器事件，每3秒触发一次
  timerEvent = this.time.addEvent({
    delay: 3000,           // 3秒
    callback: () => {
      // 检查是否已达到最大数量
      if (triangleCount < 5) {
        // 生成随机位置（避免超出边界）
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(50, 550);
        
        // 创建三角形精灵
        const triangle = this.add.image(x, y, 'pinkTriangle');
        
        // 添加简单的缩放动画效果
        triangle.setScale(0);
        this.tweens.add({
          targets: triangle,
          scale: 1,
          duration: 300,
          ease: 'Back.easeOut'
        });
        
        // 增加计数
        triangleCount++;
        countText.setText(`三角形数量: ${triangleCount}/5`);
        
        // 如果达到5个，移除定时器
        if (triangleCount >= 5) {
          timerEvent.remove();
          
          // 显示完成提示
          this.add.text(400, 300, '已生成5个三角形！', {
            fontSize: '24px',
            color: '#00ff00'
          }).setOrigin(0.5);
        }
      }
    },
    callbackScope: this,
    loop: true             // 循环执行
  });
}

function update(time, delta) {
  // 本示例不需要每帧更新逻辑
}

new Phaser.Game(config);