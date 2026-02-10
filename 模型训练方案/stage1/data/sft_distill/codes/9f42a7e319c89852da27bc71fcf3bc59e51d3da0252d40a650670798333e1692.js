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

// 存储生成的方块
let squares = [];
let timerEvent = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建红色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('redSquare', 50, 50);
  graphics.destroy();

  // 添加标题文本
  this.add.text(400, 30, '每0.5秒生成一个红色方块（最多3个）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 显示当前方块数量
  const countText = this.add.text(400, 70, '当前方块数: 0 / 3', {
    fontSize: '18px',
    color: '#00ff00'
  }).setOrigin(0.5);

  // 创建定时器，每0.5秒触发一次
  timerEvent = this.time.addEvent({
    delay: 500,  // 0.5秒 = 500毫秒
    callback: () => {
      // 检查是否已经生成了3个方块
      if (squares.length < 3) {
        // 生成随机位置（确保方块完全在画布内）
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(120, 550);

        // 创建红色方块
        const square = this.add.image(x, y, 'redSquare');
        
        // 添加简单的出现动画
        square.setScale(0);
        this.tweens.add({
          targets: square,
          scale: 1,
          duration: 200,
          ease: 'Back.easeOut'
        });

        // 存储方块引用
        squares.push(square);

        // 更新计数文本
        countText.setText(`当前方块数: ${squares.length} / 3`);

        // 如果达到3个，移除定时器
        if (squares.length >= 3) {
          timerEvent.remove();
          
          // 显示完成提示
          this.add.text(400, 560, '已生成3个方块，定时器已停止', {
            fontSize: '16px',
            color: '#ffff00'
          }).setOrigin(0.5);
        }
      }
    },
    callbackScope: this,
    loop: true  // 循环执行
  });
}

// 创建游戏实例
new Phaser.Game(config);