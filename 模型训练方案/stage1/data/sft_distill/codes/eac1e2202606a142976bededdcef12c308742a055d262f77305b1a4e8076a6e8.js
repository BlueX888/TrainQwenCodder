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
let timerEvent;

function preload() {
  // 使用 Graphics 创建菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制橙色菱形
  graphics.fillStyle(0xff8800, 1);
  graphics.beginPath();
  graphics.moveTo(20, 0);    // 上顶点
  graphics.lineTo(40, 20);   // 右顶点
  graphics.lineTo(20, 40);   // 下顶点
  graphics.lineTo(0, 20);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 40, 40);
  graphics.destroy();
}

function create() {
  // 重置计数器
  diamondCount = 0;
  
  // 添加标题文字
  this.add.text(400, 30, 'Orange Diamonds Generator', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 添加计数显示
  const countText = this.add.text(400, 70, `Diamonds: ${diamondCount}/${MAX_DIAMONDS}`, {
    fontSize: '18px',
    color: '#ff8800'
  }).setOrigin(0.5);
  
  // 创建定时器事件，每 0.5 秒执行一次
  timerEvent = this.time.addEvent({
    delay: 500,                    // 0.5 秒 = 500 毫秒
    callback: spawnDiamond,
    callbackScope: this,
    loop: true
  });
  
  function spawnDiamond() {
    // 检查是否已达到最大数量
    if (diamondCount >= MAX_DIAMONDS) {
      timerEvent.remove();  // 停止定时器
      
      // 显示完成信息
      this.add.text(400, 550, 'All diamonds generated!', {
        fontSize: '20px',
        color: '#00ff00'
      }).setOrigin(0.5);
      
      return;
    }
    
    // 生成随机位置（留出边距）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(120, 550);
    
    // 创建菱形精灵
    const diamond = this.add.image(x, y, 'diamond');
    
    // 添加简单的缩放动画效果
    diamond.setScale(0);
    this.tweens.add({
      targets: diamond,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
    
    // 增加计数
    diamondCount++;
    
    // 更新计数显示
    countText.setText(`Diamonds: ${diamondCount}/${MAX_DIAMONDS}`);
  }
}

new Phaser.Game(config);