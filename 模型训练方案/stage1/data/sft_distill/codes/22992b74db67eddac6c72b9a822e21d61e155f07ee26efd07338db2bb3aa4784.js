class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0; // 状态信号：记录相机弹跳触发次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景网格作为视觉参考
    const graphics = this.add.graphics();
    
    // 绘制棋盘格背景
    const tileSize = 50;
    for (let y = 0; y < this.cameras.main.height; y += tileSize) {
      for (let x = 0; x < this.cameras.main.width; x += tileSize) {
        const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
        graphics.fillStyle(isEven ? 0x333333 : 0x555555, 1);
        graphics.fillRect(x, y, tileSize, tileSize);
      }
    }

    // 添加中心圆形作为焦点
    graphics.fillStyle(0xff6600, 1);
    graphics.fillCircle(400, 300, 50);

    // 添加提示文本
    const text = this.add.text(400, 100, 'Click to Shake Camera', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    text.setOrigin(0.5);

    // 添加计数器文本
    this.counterText = this.add.text(400, 500, `Shake Count: ${this.shakeCount}`, {
      fontSize: '24px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    });
    this.counterText.setOrigin(0.5);

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 只响应左键
      if (pointer.leftButtonDown()) {
        // 触发相机弹跳效果
        // 参数：强度(0.05)、持续时间(1000ms)
        this.cameras.main.shake(1000, 0.01);
        
        // 更新状态计数器
        this.shakeCount++;
        this.counterText.setText(`Shake Count: ${this.shakeCount}`);
        
        // 控制台输出验证信息
        console.log(`Camera shake triggered! Total shakes: ${this.shakeCount}`);
      }
    });

    // 监听相机弹跳完成事件
    this.cameras.main.on('camerashakecomplete', () => {
      console.log('Camera shake completed');
    });
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);