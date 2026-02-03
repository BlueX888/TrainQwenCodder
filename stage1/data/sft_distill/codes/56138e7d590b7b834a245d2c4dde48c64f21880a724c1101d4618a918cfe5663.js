class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.diamondCount = 0;
    this.maxDiamonds = 12;
    this.timerEvent = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 创建青色菱形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    
    // 绘制菱形（四个点组成）
    const size = 30;
    graphics.beginPath();
    graphics.moveTo(size, 0);      // 上顶点
    graphics.lineTo(size * 2, size); // 右顶点
    graphics.lineTo(size, size * 2); // 下顶点
    graphics.lineTo(0, size);        // 左顶点
    graphics.closePath();
    graphics.fillPath();
    
    // 生成纹理
    graphics.generateTexture('diamond', size * 2, size * 2);
    graphics.destroy();

    // 创建定时器，每3秒执行一次
    this.timerEvent = this.time.addEvent({
      delay: 3000,           // 3秒
      callback: this.spawnDiamond,
      callbackScope: this,
      loop: true             // 循环执行
    });

    // 立即生成第一个菱形
    this.spawnDiamond();
  }

  spawnDiamond() {
    // 检查是否已达到最大数量
    if (this.diamondCount >= this.maxDiamonds) {
      // 停止定时器
      if (this.timerEvent) {
        this.timerEvent.remove();
        this.timerEvent = null;
      }
      console.log('已生成12个菱形，停止生成');
      return;
    }

    // 生成随机位置（确保菱形完全在画布内）
    const padding = 30; // 菱形半径
    const randomX = Phaser.Math.Between(padding, 800 - padding);
    const randomY = Phaser.Math.Between(padding, 600 - padding);

    // 创建菱形精灵
    const diamond = this.add.image(randomX, randomY, 'diamond');
    
    // 增加计数
    this.diamondCount++;
    
    console.log(`生成第 ${this.diamondCount} 个菱形，位置: (${randomX}, ${randomY})`);
  }

  update(time, delta) {
    // 本例不需要每帧更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 启动游戏
new Phaser.Game(config);