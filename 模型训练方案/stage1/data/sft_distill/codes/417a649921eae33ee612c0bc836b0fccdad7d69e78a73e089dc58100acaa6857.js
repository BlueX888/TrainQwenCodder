class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态验证变量
    this.currentState = 'idle'; // idle, walk, run
    this.currentSpeed = 0;
    this.stateChangeCount = 0; // 记录状态切换次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建不同状态的纹理
    this.createTextures();

    // 创建角色精灵
    this.player = this.add.sprite(400, 300, 'idle');
    this.player.setScale(2);

    // 设置初始状态
    this.currentState = 'idle';
    this.currentSpeed = 0;

    // 创建状态显示文本
    this.stateText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建速度显示文本
    this.speedText = this.add.text(20, 60, '', {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建位置显示文本
    this.positionText = this.add.text(20, 100, '', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建操作提示文本
    this.add.text(20, 550, '按键操作: 1=静止 | 2=行走 | 3=跑步 | 方向键=移动', {
      fontSize: '18px',
      color: '#cccccc',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置键盘输入
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    this.cursors = this.input.keyboard.createCursorKeys();

    // 监听按键事件
    this.key1.on('down', () => this.changeState('idle'));
    this.key2.on('down', () => this.changeState('walk'));
    this.key3.on('down', () => this.changeState('run'));

    // 初始化显示
    this.updateDisplay();
  }

  createTextures() {
    // 创建静止状态纹理（蓝色）
    const idleGraphics = this.add.graphics();
    idleGraphics.fillStyle(0x0066ff, 1);
    idleGraphics.fillCircle(25, 25, 20);
    idleGraphics.fillRect(15, 45, 20, 30);
    idleGraphics.fillRect(5, 50, 10, 20); // 左臂
    idleGraphics.fillRect(35, 50, 10, 20); // 右臂
    idleGraphics.generateTexture('idle', 50, 80);
    idleGraphics.destroy();

    // 创建行走状态纹理（绿色）
    const walkGraphics = this.add.graphics();
    walkGraphics.fillStyle(0x00ff00, 1);
    walkGraphics.fillCircle(25, 25, 20);
    walkGraphics.fillRect(15, 45, 20, 30);
    walkGraphics.fillRect(5, 55, 10, 20); // 左臂（稍微向前）
    walkGraphics.fillRect(35, 45, 10, 20); // 右臂（稍微向后）
    walkGraphics.generateTexture('walk', 50, 80);
    walkGraphics.destroy();

    // 创建跑步状态纹理（红色）
    const runGraphics = this.add.graphics();
    runGraphics.fillStyle(0xff0000, 1);
    runGraphics.fillCircle(25, 25, 20);
    runGraphics.fillRect(15, 45, 20, 30);
    runGraphics.fillRect(0, 60, 10, 15); // 左臂（大幅向前）
    runGraphics.fillRect(40, 40, 10, 15); // 右臂（大幅向后）
    runGraphics.generateTexture('run', 50, 80);
    runGraphics.destroy();
  }

  changeState(newState) {
    if (this.currentState === newState) return;

    this.currentState = newState;
    this.stateChangeCount++;

    // 根据状态设置速度
    switch (newState) {
      case 'idle':
        this.currentSpeed = 0;
        this.player.setTexture('idle');
        break;
      case 'walk':
        this.currentSpeed = 120;
        this.player.setTexture('walk');
        break;
      case 'run':
        this.currentSpeed = 240; // 120 * 2
        this.player.setTexture('run');
        break;
    }

    this.updateDisplay();
  }

  updateDisplay() {
    // 更新状态文本
    const stateNames = {
      idle: '静止',
      walk: '行走',
      run: '跑步'
    };
    this.stateText.setText(`当前状态: ${stateNames[this.currentState]} (切换次数: ${this.stateChangeCount})`);

    // 更新速度文本
    this.speedText.setText(`速度: ${this.currentSpeed} px/s`);
  }

  update(time, delta) {
    // 如果是静止状态，不响应方向键
    if (this.currentState === 'idle') {
      this.positionText.setText(`位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`);
      return;
    }

    // 计算移动距离（根据帧时间和速度）
    const moveDistance = (this.currentSpeed * delta) / 1000;

    // 方向键控制移动
    let moved = false;
    if (this.cursors.left.isDown) {
      this.player.x -= moveDistance;
      moved = true;
    }
    if (this.cursors.right.isDown) {
      this.player.x += moveDistance;
      moved = true;
    }
    if (this.cursors.up.isDown) {
      this.player.y -= moveDistance;
      moved = true;
    }
    if (this.cursors.down.isDown) {
      this.player.y += moveDistance;
      moved = true;
    }

    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 50, 750);
    this.player.y = Phaser.Math.Clamp(this.player.y, 50, 550);

    // 更新位置显示
    this.positionText.setText(`位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`);
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

// 导出验证变量（用于测试）
if (typeof window !== 'undefined') {
  window.getGameState = () => {
    const scene = game.scene.scenes[0];
    return {
      currentState: scene.currentState,
      currentSpeed: scene.currentSpeed,
      stateChangeCount: scene.stateChangeCount,
      playerPosition: {
        x: Math.round(scene.player.x),
        y: Math.round(scene.player.y)
      }
    };
  };
}