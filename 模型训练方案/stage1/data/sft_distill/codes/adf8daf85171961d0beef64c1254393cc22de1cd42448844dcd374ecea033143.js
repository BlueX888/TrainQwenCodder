class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bounceCount = 0; // 状态信号：记录弹跳触发次数
    this.isBouncing = false; // 当前是否正在弹跳
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景网格，便于观察相机弹跳效果
    this.createGrid();
    
    // 创建中心的参考对象
    this.createCenterObject();
    
    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0); // 固定在相机上，不受相机移动影响
    
    // 添加空格键监听
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 监听空格键按下事件
    this.spaceKey.on('down', () => {
      this.triggerCameraBounce();
    });
    
    // 添加提示文本
    const hintText = this.add.text(400, 550, 'Press SPACE to trigger camera bounce', {
      fontSize: '24px',
      color: '#ffff00',
      align: 'center'
    });
    hintText.setOrigin(0.5);
    hintText.setScrollFactor(0);
    
    this.updateStatusText();
  }

  createGrid() {
    // 创建网格背景，便于观察相机效果
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x444444, 0.8);
    
    // 绘制垂直线
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    
    // 绘制水平线
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }
    
    // 添加一些彩色方块作为参考点
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    for (let i = 0; i < 20; i++) {
      const box = this.add.graphics();
      const color = colors[i % colors.length];
      box.fillStyle(color, 0.6);
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      box.fillRect(x - 15, y - 15, 30, 30);
    }
  }

  createCenterObject() {
    // 在中心创建一个醒目的对象
    const centerGraphics = this.add.graphics();
    
    // 绘制圆形
    centerGraphics.fillStyle(0xff6600, 1);
    centerGraphics.fillCircle(400, 300, 40);
    
    // 绘制内圆
    centerGraphics.fillStyle(0xffffff, 1);
    centerGraphics.fillCircle(400, 300, 20);
    
    // 添加十字标记
    centerGraphics.lineStyle(3, 0x000000, 1);
    centerGraphics.lineBetween(400, 260, 400, 340);
    centerGraphics.lineBetween(360, 300, 440, 300);
  }

  triggerCameraBounce() {
    // 如果已经在弹跳中，则忽略
    if (this.isBouncing) {
      console.log('Camera is already bouncing, ignoring request');
      return;
    }
    
    // 触发相机弹跳效果
    // shake(duration, intensity, force, callback, context)
    // duration: 2500ms (2.5秒)
    // intensity: 0.01 (弹跳强度)
    this.cameras.main.shake(2500, 0.01);
    
    // 更新状态
    this.bounceCount++;
    this.isBouncing = true;
    
    console.log(`Camera bounce triggered! Count: ${this.bounceCount}`);
    
    // 监听弹跳完成事件
    this.cameras.main.once('camerashakecomplete', () => {
      this.isBouncing = false;
      console.log('Camera bounce completed');
      this.updateStatusText();
    });
    
    this.updateStatusText();
  }

  updateStatusText() {
    const status = this.isBouncing ? 'BOUNCING' : 'IDLE';
    this.statusText.setText([
      `Bounce Count: ${this.bounceCount}`,
      `Status: ${status}`,
      `Duration: 2.5s`
    ]);
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);