// MenuScene - 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建标题文本
    const titleText = this.add.text(width / 2, height / 3, '游戏菜单', {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    titleText.setOrigin(0.5);

    // 使用Graphics绘制白色按钮背景
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = width / 2;
    const buttonY = height / 2;

    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0xffffff, 1);
    buttonGraphics.fillRoundedRect(
      buttonX - buttonWidth / 2,
      buttonY - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      10
    );

    // 添加按钮文本
    const buttonText = this.add.text(buttonX, buttonY, '开始游戏', {
      fontSize: '24px',
      color: '#000000',
      fontFamily: 'Arial'
    });
    buttonText.setOrigin(0.5);

    // 创建交互区域
    const buttonZone = this.add.zone(
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight
    ).setInteractive({ useHandCursor: true });

    // 添加悬停效果
    buttonZone.on('pointerover', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0xcccccc, 1);
      buttonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10
      );
    });

    buttonZone.on('pointerout', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0xffffff, 1);
      buttonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10
      );
    });

    // 点击按钮切换到游戏场景
    buttonZone.on('pointerdown', () => {
      console.log('Button clicked - Starting GameScene');
      this.scene.start('GameScene');
    });

    // 添加提示文本
    const hintText = this.add.text(width / 2, height * 0.75, '点击按钮开始游戏', {
      fontSize: '18px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    });
    hintText.setOrigin(0.5);
  }
}

// GameScene - 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 可验证的状态变量
    this.score = 0;
    this.level = 1;
    this.health = 100;
    this.gameTime = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 设置背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 显示游戏标题
    const gameTitle = this.add.text(width / 2, 50, '游戏场景', {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    gameTitle.setOrigin(0.5);

    // 显示状态信息
    this.scoreText = this.add.text(20, 20, `分数: ${this.score}`, {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'Arial'
    });

    this.levelText = this.add.text(20, 50, `等级: ${this.level}`, {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'Arial'
    });

    this.healthText = this.add.text(20, 80, `生命值: ${this.health}`, {
      fontSize: '20px',
      color: '#ff0000',
      fontFamily: 'Arial'
    });

    this.timeText = this.add.text(20, 110, `游戏时间: ${this.gameTime}s`, {
      fontSize: '20px',
      color: '#00ffff',
      fontFamily: 'Arial'
    });

    // 使用Graphics创建一个简单的玩家角色
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(width / 2, height / 2, 20);
    
    // 添加玩家标签
    this.add.text(width / 2, height / 2 + 40, '玩家', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建返回菜单按钮
    const backButtonWidth = 150;
    const backButtonHeight = 50;
    const backButtonX = width / 2;
    const backButtonY = height - 80;

    const backButtonGraphics = this.add.graphics();
    backButtonGraphics.fillStyle(0x444444, 1);
    backButtonGraphics.fillRoundedRect(
      backButtonX - backButtonWidth / 2,
      backButtonY - backButtonHeight / 2,
      backButtonWidth,
      backButtonHeight,
      8
    );

    const backButtonText = this.add.text(backButtonX, backButtonY, '返回菜单', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    backButtonText.setOrigin(0.5);

    const backButtonZone = this.add.zone(
      backButtonX,
      backButtonY,
      backButtonWidth,
      backButtonHeight
    ).setInteractive({ useHandCursor: true });

    backButtonZone.on('pointerdown', () => {
      console.log('Back button clicked - Returning to MenuScene');
      this.scene.start('MenuScene');
    });

    // 添加一些游戏说明
    const instructions = this.add.text(width / 2, height / 2 + 100, 
      '游戏已启动\n状态变量可在控制台验证\n点击下方按钮返回菜单', {
      fontSize: '18px',
      color: '#cccccc',
      fontFamily: 'Arial',
      align: 'center'
    });
    instructions.setOrigin(0.5);

    // 输出状态到控制台供验证
    console.log('GameScene started with state:', {
      score: this.score,
      level: this.level,
      health: this.health,
      gameTime: this.gameTime
    });

    // 创建一个定时器模拟游戏进程
    this.time.addEvent({
      delay: 1000,
      callback: this.updateGameState,
      callbackScope: this,
      loop: true
    });
  }

  updateGameState() {
    // 更新游戏状态
    this.gameTime += 1;
    this.score += 10;
    
    if (this.score % 100 === 0) {
      this.level += 1;
    }

    // 更新显示文本
    this.scoreText.setText(`分数: ${this.score}`);
    this.levelText.setText(`等级: ${this.level}`);
    this.timeText.setText(`游戏时间: ${this.gameTime}s`);

    // 输出状态到控制台
    console.log('Game state updated:', {
      score: this.score,
      level: this.level,
      health: this.health,
      gameTime: this.gameTime
    });
  }

  update(time, delta) {
    // 每帧更新逻辑（如果需要）
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#0f0f23',
  scene: [MenuScene, GameScene],
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);