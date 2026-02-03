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

let squareCount = 0;
const MAX_SQUARES = 5;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建橙色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('orangeSquare', 50, 50);
  graphics.destroy();

  // 创建定时器，每2秒生成一个方块
  this.time.addEvent({
    delay: 2000, // 2秒
    callback: () => {
      if (squareCount < MAX_SQUARES) {
        // 生成随机位置（确保方块完全在画布内）
        const x = Phaser.Math.Between(25, 775);
        const y = Phaser.Math.Between(25, 575);
        
        // 创建橙色方块
        const square = this.add.image(x, y, 'orangeSquare');
        
        squareCount++;
        
        console.log(`生成第 ${squareCount} 个方块，位置: (${x}, ${y})`);
      }
    },
    callbackScope: this,
    loop: true // 循环执行
  });

  // 添加文本提示
  this.add.text(10, 10, '每2秒生成一个橙色方块（最多5个）', {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 显示计数器
  const counterText = this.add.text(10, 40, '已生成: 0/5', {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 更新计数器显示
  this.time.addEvent({
    delay: 100,
    callback: () => {
      counterText.setText(`已生成: ${squareCount}/5`);
    },
    loop: true
  });
}

new Phaser.Game(config);