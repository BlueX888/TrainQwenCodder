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
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // 创建按钮背景（灰色矩形）
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = width / 2;
    const buttonY = height / 2;

    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0x808080, 1); // 灰色
    buttonGraphics.fillRoundedRect(
      buttonX - buttonWidth / 2,
      buttonY - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      10
    );

    // 创建按钮文本
    const buttonText = this.add.text(buttonX, buttonY, '开始游戏', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // 创建交互区域
    const buttonZone = this.add.zone(
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight
    ).setOrigin(0.5);
    
    buttonZone.setInteractive({ useHandCursor: true });

    // 添加悬停效果
    buttonZone.on('pointerover', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0x999999, 1); // 悬停时变亮
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
      buttonGraphics.fillStyle(0x808080, 1); // 恢复灰色
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
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0x666666, 1); // 点击时变暗
      buttonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10
      );
      
      // 延迟切换场景，显示点击效果
      this.time.delayedCall(150, () => {
        this.scene.start('GameScene');
      });
    });

    // 添加提示文本
    const hintText = this.add.text(width / 2, height * 0.75, '点击按钮开始游戏', {
      fontSize: '18px',
      color: '#cccccc'
    });
    hintText.setOrigin(0.5);
  }
}

// GameScene - 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 状态信号：分数
    this.level = 1; // 状态信号：关卡
    this.gameTime = 0; // 状态信号：游戏时间
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 重置状态信号
    this.score = 0;
    this.level = 1;
    this.gameTime = 0;

    // 创建游戏背景
    const background = this.add.graphics();
    background.fillStyle(0x1a1a2e, 1);
    background.fillRect(0, 0, width, height);

    // 创建标题
    const titleText = this.add.text(width / 2, 50, '游戏场景', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // 创建状态显示面板
    this.scoreText = this.add.text(20, 20, `分数: ${this.score}`, {
      fontSize: '20px',
      color: '#00ff00'
    });

    this.levelText = this.add.text(20, 50, `关卡: ${this.level}`, {
      fontSize: '20px',
      color: '#ffff00'
    });

    this.timeText = this.add.text(20, 80, `时间: ${this.gameTime}s`, {
      fontSize: '20px',
      color: '#00ffff'
    });

    // 创建一个可交互的游戏对象（示例：点击增加分数）
    const playerSize = 50;
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(width / 2, height / 2, playerSize);

    const playerZone = this.add.zone(width / 2, height / 2, playerSize * 2, playerSize * 2);
    playerZone.setInteractive({ useHandCursor: true });

    playerZone.on('pointerdown', () => {
      this.score += 10;
      this.scoreText.setText(`分数: ${this.score}`);
      
      // 点击时产生视觉反馈
      this.tweens.add({
        targets: playerGraphics,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        yoyo: true
      });

      // 每100分升级
      if (this.score % 100 === 0 && this.score > 0) {
        this.level++;
        this.levelText.setText(`关卡: ${this.level}`);
      }
    });

    // 添加提示文本
    const hintText = this.add.text(width / 2, height * 0.75, '点击绿色圆圈增加分数', {
      fontSize: '18px',
      color: '#cccccc'
    });
    hintText.setOrigin(0.5);

    // 创建返回菜单按钮
    const backButtonWidth = 150;
    const backButtonHeight = 50;
    const backButtonX = width / 2;
    const backButtonY = height - 80;

    const backButtonGraphics = this.add.graphics();
    backButtonGraphics.fillStyle(0x808080, 1);
    backButtonGraphics.fillRoundedRect(
      backButtonX - backButtonWidth / 2,
      backButtonY - backButtonHeight / 2,
      backButtonWidth,
      backButtonHeight,
      8
    );

    const backButtonText = this.add.text(backButtonX, backButtonY, '返回菜单', {
      fontSize: '20px',
      color: '#ffffff'
    });
    backButtonText.setOrigin(0.5);

    const backButtonZone = this.add.zone(
      backButtonX,
      backButtonY,
      backButtonWidth,
      backButtonHeight
    ).setOrigin(0.5);
    
    backButtonZone.setInteractive({ useHandCursor: true });

    backButtonZone.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // 启动游戏时间计时器
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.gameTime++;
        this.timeText.setText(`时间: ${this.gameTime}s`);
      },
      loop: true
    });
  }

  update(time, delta) {
    // 游戏更新逻辑（如果需要）
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MenuScene, GameScene] // 场景列表，第一个场景自动启动
};

// 创建游戏实例
new Phaser.Game(config);