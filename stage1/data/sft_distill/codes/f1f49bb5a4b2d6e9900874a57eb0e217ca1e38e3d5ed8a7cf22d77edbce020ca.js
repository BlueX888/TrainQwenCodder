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
  // 无需预加载资源
}

function create() {
  // 菱形计数器
  let diamondCount = 0;
  const maxDiamonds = 12;
  
  // 菱形尺寸
  const diamondSize = 30;
  
  // 创建定时器事件，每2.5秒触发一次
  this.time.addEvent({
    delay: 2500,                    // 2.5秒 = 2500毫秒
    callback: spawnDiamond,         // 回调函数
    callbackScope: this,            // 回调作用域
    loop: true,                     // 循环执行
    repeat: maxDiamonds - 1         // 重复11次（加上首次共12次）
  });
  
  // 生成菱形的函数
  function spawnDiamond() {
    diamondCount++;
    
    // 生成随机位置（留出边界空间）
    const margin = diamondSize;
    const x = Phaser.Math.Between(margin, this.scale.width - margin);
    const y = Phaser.Math.Between(margin, this.scale.height - margin);
    
    // 创建Graphics对象绘制菱形
    const graphics = this.add.graphics();
    
    // 设置紫色填充
    graphics.fillStyle(0x9933ff, 1);
    
    // 绘制菱形路径（四个顶点）
    graphics.beginPath();
    graphics.moveTo(0, -diamondSize);           // 上顶点
    graphics.lineTo(diamondSize, 0);            // 右顶点
    graphics.lineTo(0, diamondSize);            // 下顶点
    graphics.lineTo(-diamondSize, 0);           // 左顶点
    graphics.closePath();
    graphics.fillPath();
    
    // 设置菱形位置
    graphics.setPosition(x, y);
    
    // 添加文本显示当前生成数量（可选，用于调试）
    const text = this.add.text(10, 10, `Diamonds: ${diamondCount}/${maxDiamonds}`, {
      fontSize: '20px',
      color: '#ffffff'
    });
    
    // 更新或创建计数文本
    if (this.diamondText) {
      this.diamondText.setText(`Diamonds: ${diamondCount}/${maxDiamonds}`);
    } else {
      this.diamondText = text;
    }
    
    // 添加简单的缩放动画效果
    graphics.setScale(0);
    this.tweens.add({
      targets: graphics,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }
}

new Phaser.Game(config);