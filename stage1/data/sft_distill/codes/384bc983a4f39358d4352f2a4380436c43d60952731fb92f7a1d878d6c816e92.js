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
  // 生成星形纹理
  createStarTexture(this);
  
  // 星形计数器
  let starCount = 0;
  const maxStars = 12;
  
  // 创建定时器事件，每2秒生成一个星形
  this.time.addEvent({
    delay: 2000,                    // 2秒间隔
    callback: () => {
      if (starCount < maxStars) {
        // 随机生成位置（留出边距避免星形被裁切）
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(50, 550);
        
        // 创建星形图像
        const star = this.add.image(x, y, 'star');
        star.setScale(1);
        
        // 添加简单的缩放动画效果
        this.tweens.add({
          targets: star,
          scale: { from: 0, to: 1 },
          duration: 300,
          ease: 'Back.easeOut'
        });
        
        starCount++;
        
        console.log(`生成第 ${starCount} 个星形，位置: (${x}, ${y})`);
      }
    },
    callbackScope: this,
    loop: true                      // 循环执行
  });
  
  // 显示提示文本
  const text = this.add.text(400, 30, '每2秒生成一个黄色星形（最多12个）', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
  
  // 显示计数文本
  const countText = this.add.text(400, 570, '已生成: 0 / 12', {
    fontSize: '18px',
    color: '#ffff00',
    align: 'center'
  });
  countText.setOrigin(0.5);
  
  // 更新计数显示
  this.time.addEvent({
    delay: 100,
    callback: () => {
      countText.setText(`已生成: ${starCount} / 12`);
    },
    loop: true
  });
}

/**
 * 创建星形纹理
 * @param {Phaser.Scene} scene - 场景对象
 */
function createStarTexture(scene) {
  const graphics = scene.add.graphics();
  
  // 星形参数
  const points = 5;           // 5个角
  const outerRadius = 40;     // 外半径
  const innerRadius = 16;     // 内半径
  const centerX = 50;
  const centerY = 50;
  
  // 绘制星形路径
  graphics.fillStyle(0xffff00, 1);  // 黄色
  graphics.beginPath();
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边使星形更清晰
  graphics.lineStyle(2, 0xffaa00, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  
  // 销毁 graphics 对象
  graphics.destroy();
}

new Phaser.Game(config);