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

let diamondCount = 0;
const MAX_DIAMONDS = 12;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 重置计数器
  diamondCount = 0;
  
  // 使用Graphics绘制紫色菱形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  
  // 绘制菱形（四个三角形组成）
  const size = 30;
  graphics.beginPath();
  graphics.moveTo(size, 0);        // 顶点
  graphics.lineTo(size * 2, size); // 右点
  graphics.lineTo(size, size * 2); // 底点
  graphics.lineTo(0, size);        // 左点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 添加显示文本
  const text = this.add.text(10, 10, 'Diamonds: 0 / 12', {
    fontSize: '24px',
    color: '#ffffff'
  });
  
  // 创建定时器事件，每2.5秒生成一个菱形
  timerEvent = this.time.addEvent({
    delay: 2500, // 2.5秒
    callback: () => {
      if (diamondCount < MAX_DIAMONDS) {
        // 生成随机位置（避免边缘）
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(50, 550);
        
        // 创建菱形sprite
        const diamond = this.add.sprite(x, y, 'diamond');
        
        // 添加简单的缩放动画效果
        diamond.setScale(0);
        this.tweens.add({
          targets: diamond,
          scale: 1,
          duration: 300,
          ease: 'Back.easeOut'
        });
        
        // 增加计数
        diamondCount++;
        text.setText(`Diamonds: ${diamondCount} / ${MAX_DIAMONDS}`);
        
        // 如果达到最大数量，停止定时器
        if (diamondCount >= MAX_DIAMONDS) {
          timerEvent.remove();
          text.setText(`Diamonds: ${diamondCount} / ${MAX_DIAMONDS} (Complete!)`);
        }
      }
    },
    callbackScope: this,
    loop: true
  });
}

new Phaser.Game(config);