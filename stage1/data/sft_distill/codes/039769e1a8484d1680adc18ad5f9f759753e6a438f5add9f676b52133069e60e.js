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

// 存储已生成的星形
let stars = [];
let starTimer = null;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建橙色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8C00, 1); // 橙色
  
  // 绘制星形路径
  const points = 5; // 5个尖角
  const innerRadius = 15;
  const outerRadius = 30;
  const angle = Math.PI / points;
  
  graphics.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = 32 + Math.cos(i * angle - Math.PI / 2) * radius;
    const y = 32 + Math.sin(i * angle - Math.PI / 2) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
  
  // 添加标题文本
  this.add.text(400, 30, '橙色星形生成器', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 添加计数文本
  const countText = this.add.text(400, 570, '星形数量: 0 / 10', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 创建定时器，每隔1秒生成一个星形
  starTimer = this.time.addEvent({
    delay: 1000, // 1秒
    callback: () => {
      // 检查是否已达到最大数量
      if (stars.length < 10) {
        // 生成随机位置（避免边缘，留出星形半径空间）
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(80, 520);
        
        // 创建星形图像
        const star = this.add.image(x, y, 'star');
        
        // 添加缩放动画效果
        star.setScale(0);
        this.tweens.add({
          targets: star,
          scale: 1,
          duration: 300,
          ease: 'Back.easeOut'
        });
        
        // 添加到数组
        stars.push(star);
        
        // 更新计数文本
        countText.setText(`星形数量: ${stars.length} / 10`);
        
        // 如果达到10个，移除定时器
        if (stars.length >= 10) {
          starTimer.remove();
          
          // 显示完成提示
          this.add.text(400, 300, '已生成10个星形！', {
            fontSize: '32px',
            color: '#FFD700',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
          }).setOrigin(0.5);
        }
      }
    },
    loop: true // 循环执行
  });
}

// 创建游戏实例
new Phaser.Game(config);