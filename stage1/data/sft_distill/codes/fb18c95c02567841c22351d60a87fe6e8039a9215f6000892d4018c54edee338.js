class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0; // 状态信号：记录弹跳触发次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 绘制背景网格，便于观察相机弹跳效果
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    // 绘制垂直线
    for (let x = 0; x <= width; x += 50) {
      graphics.lineBetween(x, 0, x, height);
    }
    
    // 绘制水平线
    for (let y = 0; y <= height; y += 50) {
      graphics.lineBetween(0, y, width, y);
    }

    // 绘制中心标记物
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 30);
    
    centerGraphics.fillStyle(0xffffff, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 20);
    
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 10);

    // 添加装饰方块
    const decorGraphics = this.add.graphics();
    decorGraphics.fillStyle(0x00ff00, 1);
    decorGraphics.fillRect(100, 100, 60, 60);
    
    decorGraphics.fillStyle(0x0000ff, 1);
    decorGraphics.fillRect(width - 160, 100, 60, 60);
    
    decorGraphics.fillStyle(0xffff00, 1);
    decorGraphics.fillRect(100, height - 160, 60, 60);
    
    decorGraphics.fillStyle(0xff00ff, 1);
    decorGraphics.fillRect(width - 160, height - 160, 60, 60);

    // 添加提示文本
    this.instructionText = this.add.text(width / 2, 50, 'Press W/A/S/D to shake camera', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setOrigin(0.5, 0.5);

    // 添加状态显示文本
    this.statusText = this.add.text(width / 2, height - 50, `Shake Count: ${this.shakeCount}`, {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5, 0.5);

    // 创建WASD按键
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 标记是否正在弹跳
    this.isShaking = false;

    // 监听按键事件
    this.keyW.on('down', () => this.triggerShake('W'));
    this.keyA.on('down', () => this.triggerShake('A'));
    this.keyS.on('down', () => this.triggerShake('S'));
    this.keyD.on('down', () => this.triggerShake('D'));

    // 添加按键状态指示器
    this.createKeyIndicators();
  }

  createKeyIndicators() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2 + 150;
    const size = 40;
    const spacing = 50;

    // 创建WASD按键指示器
    this.indicators = {};

    // W键指示器（上）
    this.indicators.W = this.add.graphics();
    this.indicators.W.x = centerX;
    this.indicators.W.y = centerY - spacing;
    this.drawKeyIndicator(this.indicators.W, 'W', false);

    // A键指示器（左）
    this.indicators.A = this.add.graphics();
    this.indicators.A.x = centerX - spacing;
    this.indicators.A.y = centerY;
    this.drawKeyIndicator(this.indicators.A, 'A', false);

    // S键指示器（下）
    this.indicators.S = this.add.graphics();
    this.indicators.S.x = centerX;
    this.indicators.S.y = centerY;
    this.drawKeyIndicator(this.indicators.S, 'S', false);

    // D键指示器（右）
    this.indicators.D = this.add.graphics();
    this.indicators.D.x = centerX + spacing;
    this.indicators.D.y = centerY;
    this.drawKeyIndicator(this.indicators.D, 'D', false);
  }

  drawKeyIndicator(graphics, key, active) {
    graphics.clear();
    const size = 40;
    const color = active ? 0x00ff00 : 0x666666;
    
    graphics.fillStyle(color, 1);
    graphics.fillRect(-size / 2, -size / 2, size, size);
    
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(-size / 2, -size / 2, size, size);
  }

  triggerShake(key) {
    // 如果已经在弹跳中，不重复触发
    if (this.isShaking) {
      return;
    }

    this.isShaking = true;
    this.shakeCount++;

    // 更新状态文本
    this.statusText.setText(`Shake Count: ${this.shakeCount} (Last: ${key})`);

    // 激活按键指示器
    this.drawKeyIndicator(this.indicators[key], key, true);

    // 触发相机弹跳效果，持续3000毫秒
    // 参数：duration(ms), intensity(shake强度)
    this.cameras.main.shake(3000, 0.01);

    // 3秒后恢复状态
    this.time.delayedCall(3000, () => {
      this.isShaking = false;
      // 恢复按键指示器
      this.drawKeyIndicator(this.indicators[key], key, false);
    });
  }

  update(time, delta) {
    // 实时更新按键状态（视觉反馈）
    if (!this.isShaking) {
      if (this.keyW.isDown) {
        this.drawKeyIndicator(this.indicators.W, 'W', true);
      } else {
        this.drawKeyIndicator(this.indicators.W, 'W', false);
      }

      if (this.keyA.isDown) {
        this.drawKeyIndicator(this.indicators.A, 'A', true);
      } else {
        this.drawKeyIndicator(this.indicators.A, 'A', false);
      }

      if (this.keyS.isDown) {
        this.drawKeyIndicator(this.indicators.S, 'S', true);
      } else {
        this.drawKeyIndicator(this.indicators.S, 'S', false);
      }

      if (this.keyD.isDown) {
        this.drawKeyIndicator(this.indicators.D, 'D', true);
      } else {
        this.drawKeyIndicator(this.indicators.D, 'D', false);
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  parent: 'game-container'
};

new Phaser.Game(config);