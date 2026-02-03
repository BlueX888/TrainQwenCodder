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
    
    // 添加标题
    const title = this.add.text(width / 2, height / 3, '游戏菜单', {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    title.setOrigin(0.5);

    // 绘制绿色按钮背景
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = width / 2;
    const buttonY = height / 2;

    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0x00ff00, 1);
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
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // 设置交互区域
    const buttonZone = this.add.zone(
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight
    ).setOrigin(0.5);
    buttonZone.setInteractive({ useHandCursor: true });

    // 鼠标悬停效果
    buttonZone.on('pointerover', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0x00cc00, 1);
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
      buttonGraphics.fillStyle(0x00ff00, 1);
      buttonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10
      );
    });

    // 点击按钮切换场景
    buttonZone.on('pointerdown', () => {
      // 添加点击反馈
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0x009900, 1);
      buttonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10
      );
      
      // 延迟切换场景，让玩家看到点击效果
      this.time.delayedCall(150, () => {
        this.scene.start('GameScene');
      });
    });

    // 添加提示文本
    const hint = this.add.text(width / 2, height * 0.75, '点击按钮开始游戏', {
      fontSize: '16px',
      color: '#cccccc',
      fontFamily: 'Arial'
    });
    hint.setOrigin(0.5);
  }
}

// GameScene - 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 可验证的状态信号
    this.score = 0;
    this.level = 1;
    this.health = 100;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 游戏标题
    const gameTitle = this.add.text(width / 2, 50, '游戏场景', {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    gameTitle.setOrigin(0.5);

    // 显示可验证的状态信号
    this.scoreText = this.add.text(20, 20, `分数: ${this.score}`, {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'Arial'
    });

    this.levelText = this.add.text(20, 50, `等级: ${this.level}`, {
      fontSize: '20px',
      color: '#00ffff',
      fontFamily: 'Arial'
    });

    this.healthText = this.add.text(20, 80, `生命值: ${this.health}`, {
      fontSize: '20px',
      color: '#ff0000',
      fontFamily: 'Arial'
    });

    // 创建一个简单的游戏对象（玩家方块）
    const player = this.add.graphics();
    player.fillStyle(0x0000ff, 1);
    player.fillRect(width / 2 - 25, height / 2 - 25, 50, 50);

    // 添加说明文本
    const instruction = this.add.text(width / 2, height - 100, '游戏已开始！\n按 ESC 返回菜单', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    });
    instruction.setOrigin(0.5);

    // 添加返回菜单按钮
    const backButtonWidth = 150;
    const backButtonHeight = 50;
    const backButtonX = width / 2;
    const backButtonY = height - 40;

    const backButtonGraphics = this.add.graphics();
    backButtonGraphics.fillStyle(0xff6600, 1);
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
    ).setOrigin(0.5);
    backButtonZone.setInteractive({ useHandCursor: true });

    backButtonZone.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // ESC 键返回菜单
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });

    // 模拟游戏逻辑：定时增加分数
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.score += 10;
        this.scoreText.setText(`分数: ${this.score}`);
        
        // 每 100 分升级
        if (this.score % 100 === 0 && this.score > 0) {
          this.level++;
          this.levelText.setText(`等级: ${this.level}`);
        }
      },
      loop: true
    });
  }

  update(time, delta) {
    // 游戏更新逻辑（如果需要）
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: [MenuScene, GameScene], // 注册两个场景
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);