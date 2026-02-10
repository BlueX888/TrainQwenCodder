class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerState = 'idle'; // 可验证的状态变量: idle, walk, run
    this.currentSpeed = 0;
    this.stateIndex = 0; // 0: idle, 1: walk, 2: run
  }

  preload() {
    // 程序化生成角色纹理
    this.createPlayerTextures();
  }

  create() {
    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建玩家精灵
    this.player = this.add.sprite(400, 300, 'player_idle');
    this.player.setScale(2);

    // 创建状态显示文本
    this.stateText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建控制说明文本
    this.add.text(20, 560, 'SPACE: 切换状态 | 方向键: 移动', {
      fontSize: '18px',
      color: '#aaaaaa'
    });

    // 键盘输入设置
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 监听空格键切换状态
    this.spaceKey.on('down', () => {
      this.switchState();
    });

    // 初始化状态显示
    this.updateStateDisplay();
  }

  createPlayerTextures() {
    const graphics = this.add.graphics();

    // 静止状态 - 蓝色方块
    graphics.clear();
    graphics.fillStyle(0x3498db, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(1, 1, 30, 30);
    // 添加眼睛
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(10, 12, 3);
    graphics.fillCircle(22, 12, 3);
    graphics.generateTexture('player_idle', 32, 32);

    // 行走状态 - 绿色方块
    graphics.clear();
    graphics.fillStyle(0x2ecc71, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(1, 1, 30, 30);
    // 添加眼睛和微笑
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(10, 12, 3);
    graphics.fillCircle(22, 12, 3);
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.beginPath();
    graphics.arc(16, 16, 8, 0, Math.PI, false);
    graphics.strokePath();
    graphics.generateTexture('player_walk', 32, 32);

    // 跑步状态 - 红色方块
    graphics.clear();
    graphics.fillStyle(0xe74c3c, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(1, 1, 30, 30);
    // 添加眼睛和大笑
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(10, 12, 3);
    graphics.fillCircle(22, 12, 3);
    graphics.lineStyle(3, 0xffffff, 1);
    graphics.beginPath();
    graphics.arc(16, 16, 10, 0, Math.PI, false);
    graphics.strokePath();
    // 添加速度线条
    graphics.lineStyle(2, 0xffffff, 0.5);
    graphics.lineBetween(-5, 10, 0, 10);
    graphics.lineBetween(-8, 16, 0, 16);
    graphics.lineBetween(-5, 22, 0, 22);
    graphics.generateTexture('player_run', 32, 32);

    graphics.destroy();
  }

  switchState() {
    this.stateIndex = (this.stateIndex + 1) % 3;

    switch (this.stateIndex) {
      case 0:
        this.playerState = 'idle';
        this.currentSpeed = 0;
        this.player.setTexture('player_idle');
        break;
      case 1:
        this.playerState = 'walk';
        this.currentSpeed = 240;
        this.player.setTexture('player_walk');
        break;
      case 2:
        this.playerState = 'run';
        this.currentSpeed = 240 * 2;
        this.player.setTexture('player_run');
        break;
    }

    this.updateStateDisplay();
  }

  updateStateDisplay() {
    const stateNames = {
      'idle': '静止',
      'walk': '行走',
      'run': '跑步'
    };

    this.stateText.setText(
      `状态: ${stateNames[this.playerState]}\n` +
      `速度: ${this.currentSpeed} px/s\n` +
      `位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    );
  }

  update(time, delta) {
    // 移动逻辑
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown) {
      velocityX = -1;
    } else if (this.cursors.right.isDown) {
      velocityX = 1;
    }

    if (this.cursors.up.isDown) {
      velocityY = -1;
    } else if (this.cursors.down.isDown) {
      velocityY = 1;
    }

    // 归一化对角线移动
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707; // 1/sqrt(2)
      velocityY *= 0.707;
    }

    // 应用速度
    const moveDistance = this.currentSpeed * (delta / 1000);
    this.player.x += velocityX * moveDistance;
    this.player.y += velocityY * moveDistance;

    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 32, 768);
    this.player.y = Phaser.Math.Clamp(this.player.y, 32, 568);

    // 更新状态显示
    if (velocityX !== 0 || velocityY !== 0) {
      this.updateStateDisplay();
    }

    // 根据移动方向翻转精灵
    if (velocityX < 0) {
      this.player.setFlipX(true);
    } else if (velocityX > 0) {
      this.player.setFlipX(false);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  pixelArt: true
};

new Phaser.Game(config);